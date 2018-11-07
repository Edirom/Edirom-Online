<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" xmlns:xhtml="http://www.w3.org/1999/xhtml"
    exclude-result-prefixes="xs xd" version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Feb 27, 2016</xd:p>
            <xd:p><xd:b>Author:</xd:b> Benjamin W. Bohl</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] create external link<param name="ptr">ptr</param><param name="dest"
                >dest</param><param name="class">class</param></desc>
    </doc>
    <xsl:template name="makeExternalLink">
        <xsl:param name="ptr" as="xs:boolean" select="false()"/>
        <xsl:param name="dest"/>
        <xsl:param name="class">link_<xsl:value-of select="local-name(.)"/></xsl:param>
        <a>
            <xsl:choose>
                <xsl:when test="@rend">
                    <xsl:attribute name="class">
                        <xsl:value-of select="@rend"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:when test="@rendition">
                    <xsl:call-template name="applyRendition"/>
                </xsl:when>
                <xsl:when test="parent::tei:item/parent::tei:list[@rend]">
                    <xsl:attribute name="class">
                        <xsl:value-of select="parent::tei:item/parent::tei:list/@rend"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:when test="parent::tei:item[@rend]">
                    <xsl:attribute name="class">
                        <xsl:value-of select="parent::tei:item/@rend"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="class">
                        <xsl:value-of select="$class"/>
                    </xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:if test="@type">
                <xsl:attribute name="type">
                    <xsl:value-of select="@type"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:attribute name="href"/>
            <xsl:attribute name="onclick">
                <!-- 2016-02-27 bwb mods are here -->
                <xsl:text>window.open('</xsl:text>
                <xsl:value-of select="$dest"/>
                <!--<xsl:if test="contains(@from,'id (')">
                    <xsl:text>#</xsl:text>
                    <xsl:value-of select="substring(@from,5,string-length(normalize-space(@from))-1)"/>
                </xsl:if>-->
                <xsl:text>');</xsl:text>
            </xsl:attribute>
            <xsl:choose>
                <xsl:when test="@n">
                    <xsl:attribute name="title">
                        <xsl:value-of select="@n"/>
                    </xsl:attribute>
                </xsl:when>
            </xsl:choose>
            <xsl:call-template name="xrefHook"/>
            <xsl:choose>
                <xsl:when test="$dest=''">??</xsl:when>
                <xsl:when test="$ptr">
                    <xsl:element name="{$urlMarkup}">
                        <xsl:choose>
                            <xsl:when test="starts-with($dest,'mailto:')">
                                <xsl:value-of select="substring-after($dest,'mailto:')"/>
                            </xsl:when>
                            <xsl:when test="starts-with($dest,'file:')">
                                <xsl:value-of select="substring-after($dest,'file:')"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="$dest"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:element>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
        </a>
    </xsl:template>
</xsl:stylesheet>
