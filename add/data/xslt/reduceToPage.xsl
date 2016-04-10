<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    exclude-result-prefixes="xs xd"
    version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Jun 11, 2014</xd:p>
            <xd:p><xd:b>Author:</xd:b> Daniel Röwenstrunk</xd:p>
            <xd:p></xd:p>
        </xd:desc>
    </xd:doc>
    
    <xsl:param name="pb1"/>
    <xsl:param name="pb2"/>
    
    <xsl:output indent="yes"/>
    
    <xsl:template match="/">
        <!-- (//pb[@n eq '22v']/ancestor::*[.//pb[@n eq '23r']] -->
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:choose>
            <xsl:when test=".[./descendant-or-self::tei:pb[@n eq $pb1]]">
                <xsl:copy>
                    <xsl:apply-templates select="@* | node()[./descendant-or-self::tei:pb[@n eq $pb1] or ./preceding::tei:pb[@n eq $pb1]]"/>
                </xsl:copy>
            </xsl:when>
            <xsl:when test=".[./descendant::tei:pb[@n eq $pb2]]">
                <xsl:copy>
                    <xsl:apply-templates select="@* | node()[./descendant-or-self::tei:pb[@n eq $pb2] or ./following::tei:pb[@n eq $pb2] or $pb2 eq '']"/>
                </xsl:copy>
            </xsl:when>
            <xsl:when test=".[./preceding::tei:pb[@n eq $pb1] and (./following::tei:pb[@n eq $pb2] or $pb2 eq '')]">
                <xsl:copy>
                    <xsl:apply-templates select="@* | node()"/>
                </xsl:copy>
            </xsl:when>
            <xsl:otherwise/>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:pb">
        <xsl:choose>
    <xsl:when test="@n eq $pb1">
    <xsl:copy>
                    <xsl:apply-templates select="@*"/>
        </xsl:copy>
    </xsl:when>
            <xsl:when test="@n eq $pb2 and @rend eq '-'">
            <xsl:copy>
                    <xsl:apply-templates select="@* except @n"/>
        </xsl:copy>
    </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="@*">
        <xsl:copy/>
    </xsl:template>
    <xsl:template match="text()">
        <xsl:choose><xsl:when test=".[./preceding::tei:pb[@n eq $pb1] and (./following::tei:pb[@n eq $pb2] or $pb2 eq '')]">
                <xsl:copy/>
    </xsl:when>
            <xsl:otherwise/>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>