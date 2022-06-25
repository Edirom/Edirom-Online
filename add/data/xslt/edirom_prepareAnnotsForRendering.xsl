<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:mei="http://www.music-encoding.org/ns/mei"
    exclude-result-prefixes="xs math xd mei"
    version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Jun 25, 2022</xd:p>
            <xd:p><xd:b>Author:</xd:b> Johannes Kepper</xd:p>
            <xd:p>
                This XSLT massages annot elements in MEI to make it easier to pick them up for rendering annotations on top of a Verovio rendering.
            </xd:p>
        </xd:desc>
    </xd:doc>
    
    <!-- no indentation to save bandwidth -->
    <xsl:output method="xml" indent="no"/>
    
    <xsl:variable name="annots" as="node()*">
        <xsl:for-each select="//mei:annot[contains(@type,'editorialComment')][@tstamp2]">
            <!-- get only those annots that affect more than one measure -->
            <xsl:if test="not(starts-with(@tstamp2,'0m'))">
                <annotRef annot="{@xml:id}" class="{@class}" staff="{@staff}">
                    <xsl:variable name="affects.num" select="xs:integer(substring-before(@tstamp2,'m+'))" as="xs:integer"/>
                    <xsl:variable name="measure.ids" select="parent::mei:measure/following::mei:measure[position() le $affects.num]/xs:string(@xml:id)" as="xs:string+"/>
                    <xsl:for-each select="$measure.ids">
                        <measure ref="{.}" pos="{position()}"/>
                    </xsl:for-each>
                </annotRef>
            </xsl:if>
        </xsl:for-each>
    </xsl:variable>
    
    <xsl:template match="/">
        <xsl:message select="'Found ' || count($annots/descendant-or-self::annotRef) || ' annotRefs with ' || count($annots//measure) || ' measures'"/>
        <xsl:apply-templates select="node()"/>
    </xsl:template>
    
    <xsl:template match="mei:measure">
        <xsl:variable name="measure.id" select="string(@xml:id)" as="xs:string"/>
        <xsl:copy>
            <xsl:apply-templates select="node() | @*"/>
            <xsl:for-each select="$annots//measure[@ref = $measure.id]">
                <xsl:message select="'  gotcha: ' || $measure.id"/>
                <xsl:variable name="measureRef" select="." as="element()"/>
                <xsl:variable name="annotRef" select="$measureRef/parent::annotRef" as="element()"/>
                <annot xmlns="http://www.music-encoding.org/ns/mei">
                    <xsl:attribute name="type" select="'annotRef ' || replace($annotRef/@class,'#','')"/>
                    <xsl:attribute name="staff" select="$annotRef/@staff"/>
                    <xsl:attribute name="xml:id" select="$annotRef/@annot"/>
                </annot>
            </xsl:for-each>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="mei:annot[contains(@type, 'editorialComment')]">
        <xsl:copy>
            <xsl:apply-templates select="@* except @type"/>
            <xsl:attribute name="type" select="xs:string(@type) || ' ' || replace(@class,'#','')"/>
            <xsl:apply-templates select="node()"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="node() | @*" mode="#all">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    
    
</xsl:stylesheet>