<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:html="http://www.w3.org/1999/xhtml" xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs xd html" version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Jun 19, 2013</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> Daniel Röwenstrunk</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <xsl:output encoding="UTF-8" method="xml"/>
    <xsl:template match="html:div[contains(@class, 'p-in-sp') and (.//html:span[contains(@class, 'add') or contains(@class, 'del') or contains(@class, 'subst')])]">
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <div class="difference">
                <div class="hand1_bg writerBox">
                    <div class="diff_desc">Kopist 1<i class="fa fa-caret-down fa-fw"/>
                    </div>
                    <xsl:apply-templates mode="origin"/>
                </div>
                <div class="hand2_bg writerBox">
                    <div class="diff_desc">Kopist 2<i class="fa fa-caret-down fa-fw"/>
                    </div>
                    <xsl:apply-templates mode="hand">
                        <xsl:with-param name="hand" select="'#Kopist_2'"/>
                    </xsl:apply-templates>
                </div>
            </div>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="node() | @* | comment() | processing-instruction()">
        <xsl:copy>
            <xsl:apply-templates select="@* | node()"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>